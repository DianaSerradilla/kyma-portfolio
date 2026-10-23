import gsap from 'gsap'
import type * as ThreeNS from 'three'
import type { TeamMember } from '../../data/team'

type Three = typeof ThreeNS

// World units. The camera looks at z = 0 from z = 10 with a 38° field of view.
const PANEL_W = 2.7
const PANEL_H = 3.8
const SEG_X = 20 // segments per panel, along the strip
const SEG_Y = 24
const TILE_W = 460 // atlas tile, in pixels
const TILE_H = 640
const VIDEO_FPS = 25 // how often video frames are copied into the atlas
const FOV = 38
const CAMERA_Z = 9.5
const TILT = -0.62 // radians: the strip runs from the bottom right up to the top, clear of the text
const START_X = 0.6 // where the strip begins when the section pins: the first photo sits low, not cut at the top
const REEL_H = PANEL_H // the video frame that follows the last photo is as tall as the photos...
const REEL_W = (REEL_H * 16) / 9 // ...and 16:9
const REEL_GAP = 0.25 // gap between the last photo and the frame
const REEL_REST = 1.6 // where the frame rests along the strip when it is ready to open (from the anchor)
const REEL_SEG_X = SEG_X * 3

// Where the strip sits, as a fraction of the view: to the right of and above the text.
const ANCHOR_X = 0.3
const ANCHOR_Y = 0.06

// Shape of the bent wall.
const WRAP = 0.055 // the wall curves towards the viewer along its length, wrapping around the text
const BOW = 0.14 // each panel bows across its height
const PANEL_BEND = 0.32 // each panel is curved like a bent screen (its edges come forward)
const WAVE = 0.1 // gentle undulation

// Safety net: anything that would reach the text column fades out (NDC x, -1 left .. 1 right).
const FADE_FROM = -0.14
const FADE_TO = 0.1

type Options = {
  wrap: HTMLElement
  label: HTMLElement
  members: TeamMember[]
  /** 0..1 scroll progress of the pinned section. */
  progressRef: { current: number }
  /** 0..1 how far the section has arrived (before it pins); the strip fades in with it. */
  enterRef: { current: number }
  /** Holds the brandboard <video> (its frames become the texture of the last panel) and its controls. */
  reel: HTMLElement
  /** Still shown on the last panel until the video has its first frame. */
  reelPoster: string
  /** 0..1 how far the frame has grown from its place in the strip to the whole screen. */
  expandRef: { current: number }
  onHover: (index: number) => void
  /** Called with true once the frame starts to open (the video should play) and false when it closes. */
  onReel: (open: boolean) => void
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

type Source = { source: CanvasImageSource; width: number; height: number }

// Draws a source into the atlas tile of a member, "cover" style, biased towards the top so faces are kept.
function drawTile(ctx: CanvasRenderingContext2D, { source, width, height }: Source, index: number) {
  const target = TILE_W / TILE_H
  let sx = 0
  let sy = 0
  let sw = width
  let sh = height
  if (width / height > target) {
    sw = height * target
    sx = (width - sw) / 2
  } else {
    sh = width / target
    sy = (height - sh) * 0.25
  }
  ctx.drawImage(source, sx, sy, sw, sh, index * TILE_W, 0, TILE_W, TILE_H)
}

// All portraits side by side in a single texture, so the strip is one continuous surface.
// It starts with the still portraits; the video frames are drawn over them afterwards.
async function buildAtlas(members: TeamMember[]) {
  const canvas = document.createElement('canvas')
  canvas.width = TILE_W * members.length
  canvas.height = TILE_H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2d context unavailable')
  ctx.fillStyle = '#070707'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  await Promise.all(
    members.map(async (member, index) => {
      const image = await loadImage(member.photo)
      drawTile(ctx, { source: image, width: image.width, height: image.height }, index)
    }),
  )
  return { canvas, ctx }
}

// One muted, looping <video> per member. They stay in the DOM (invisible) because some
// browsers only decode video that is attached to the page.
function createVideos(members: TeamMember[], parent: HTMLElement) {
  return members.map((member) => {
    const video = document.createElement('video')
    video.src = member.video
    video.muted = true
    video.loop = true
    video.playsInline = true
    video.preload = 'auto'
    video.setAttribute('aria-hidden', 'true')
    video.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none'
    parent.appendChild(video)
    return video
  })
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vView;
  varying float vNdcX;
  void main() {
    vUv = uv;
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vView = viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
    vNdcX = gl_Position.x / gl_Position.w;
  }
`

// Rounded panels with a thin gap between them; grayscale until hovered.
// Surfaces turned away from the viewer are darker, which is what makes the bend readable.
const fragmentShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vView;
  varying float vNdcX;
  uniform sampler2D uMap;
  uniform float uHover[N];
  const vec2 PANEL = vec2(${PANEL_W.toFixed(2)}, ${PANEL_H.toFixed(2)});

  float roundBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    float f = vUv.x * float(N);
    int index = int(floor(f));
    vec2 p = (vec2(fract(f), vUv.y) - 0.5) * PANEL;
    float d = roundBox(p, PANEL * 0.5 - 0.035, 0.13);
    float aa = fwidth(d);
    float alpha = 1.0 - smoothstep(-aa, aa, d);
    if (alpha < 0.01) discard;

    vec3 colour = texture2D(uMap, vUv).rgb;
    float hover = 0.0;
    for (int i = 0; i < N; i++) {
      if (i == index) hover = uHover[i];
    }
    float grey = dot(colour, vec3(0.299, 0.587, 0.114));
    // Dimmed grayscale at rest; full colour on hover.
    vec3 base = mix(vec3(grey) * 0.62, colour, hover);

    vec3 normal = normalize(cross(dFdx(vView), dFdy(vView)));
    float facing = abs(normal.z);
    float shade = mix(0.45, 1.0, smoothstep(0.45, 0.98, facing));

    float fade = smoothstep(${FADE_FROM.toFixed(2)}, ${FADE_TO.toFixed(2)}, vNdcX);
    gl_FragColor = vec4(base * shade, alpha * fade);
  }
`

// The video panel: the same rounded, shaded surface as the photos, but in colour. While it
// opens (uT: 0 -> 1) its corners square off, the shading goes away and the video is
// cropped to fill the shape, whatever its proportions.
const reelFragmentShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vView;
  varying float vNdcX;
  uniform sampler2D uMap;
  uniform vec2 uPlane;
  uniform float uT;

  float roundBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    vec2 p = (vUv - 0.5) * uPlane;
    float d = roundBox(p, uPlane * 0.5 - mix(0.035, 0.0, uT), mix(0.13, 0.0, uT));
    float aa = fwidth(d);
    float alpha = 1.0 - smoothstep(-aa, aa, d);
    if (alpha < 0.01) discard;

    float planeAspect = uPlane.x / uPlane.y;
    const float videoAspect = 16.0 / 9.0;
    vec2 uv = vUv;
    if (planeAspect > videoAspect) uv.y = (uv.y - 0.5) * (videoAspect / planeAspect) + 0.5;
    else uv.x = (uv.x - 0.5) * (planeAspect / videoAspect) + 0.5;
    vec3 colour = texture2D(uMap, uv).rgb;

    vec3 normal = normalize(cross(dFdx(vView), dFdy(vView)));
    float shade = mix(mix(0.45, 1.0, smoothstep(0.45, 0.98, abs(normal.z))), 1.0, uT);
    float fade = mix(smoothstep(${FADE_FROM.toFixed(2)}, ${FADE_TO.toFixed(2)}, vNdcX), 1.0, uT);
    gl_FragColor = vec4(colour * shade, alpha * fade);
  }
`

// A continuous strip of portraits that bends around the viewer and travels along
// a diagonal as the section is scrolled. Returns a function that cleans everything up.
export function createRibbonScene(
  THREE: Three,
  { wrap, label, members, progressRef, enterRef, reel, reelPoster, expandRef, onHover, onReel }: Options,
) {
  const count = members.length
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setClearColor(0x000000, 0)
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%'
  wrap.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100)
  camera.position.z = CAMERA_Z
  const group = new THREE.Group()
  group.rotation.z = TILT
  scene.add(group)

  const totalLength = count * PANEL_W
  // Where the middle of the video frame sits along the strip, and how far the strip must
  // travel to bring it to the anchor point (its resting place beside the last photo).
  const reelAlong = totalLength + REEL_GAP + REEL_W / 2
  const travel = START_X + reelAlong - REEL_REST
  const geometry = new THREE.PlaneGeometry(totalLength, PANEL_H, SEG_X * count, SEG_Y)
  const position = geometry.attributes.position as ThreeNS.BufferAttribute
  const basePositions = Float32Array.from(position.array)
  const hoverValues = Array.from({ length: count }, () => 0)

  const material = new THREE.ShaderMaterial({
    defines: { N: count },
    uniforms: { uMap: { value: null }, uHover: { value: hoverValues } },
    vertexShader,
    fragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.frustumCulled = false

  // The video panel is a second surface, bent with the same formula right after the last photo.
  // It is drawn on top of everything, so once it has grown it covers the strip behind it.
  const reelGeometry = new THREE.PlaneGeometry(REEL_W, REEL_H, REEL_SEG_X, SEG_Y)
  const reelPosition = reelGeometry.attributes.position as ThreeNS.BufferAttribute
  const reelBase = Float32Array.from(reelPosition.array)
  const reelMaterial = new THREE.ShaderMaterial({
    uniforms: { uMap: { value: null }, uPlane: { value: new THREE.Vector2(REEL_W, REEL_H) }, uT: { value: 0 } },
    vertexShader,
    fragmentShader: reelFragmentShader,
    transparent: true,
    depthTest: false,
    side: THREE.DoubleSide,
  })
  const reelMesh = new THREE.Mesh(reelGeometry, reelMaterial)
  reelMesh.frustumCulled = false
  reelMesh.renderOrder = 1
  scene.add(reelMesh)
  const reelVideo = reel.querySelector('video')
  let posterTexture: ThreeNS.Texture | null = null
  let videoTexture: ThreeNS.VideoTexture | null = null
  new THREE.TextureLoader().load(reelPoster, (loaded) => {
    if (disposed) {
      loaded.dispose()
      return
    }
    posterTexture = loaded
    if (!videoTexture) reelMaterial.uniforms.uMap.value = loaded
  })

  let disposed = false
  let texture: ThreeNS.CanvasTexture | null = null
  let current = progressRef.current
  let expanded = expandRef.current
  let reelOpen = false
  let hovered = -1
  const ndc = new THREE.Vector2()
  let pointerInside = false
  const raycaster = new THREE.Raycaster()
  const tmp = new THREE.Vector3()

  // Video frames are copied into the atlas while the strip is on screen.
  let atlasContext: CanvasRenderingContext2D | null = null
  let videos: HTMLVideoElement[] = []
  let inView = false
  let lastVideoDraw = 0

  function setPlaying(playing: boolean) {
    for (const video of videos) {
      if (playing) void video.play().catch(() => undefined)
      else video.pause()
    }
  }

  const visibility = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting
    setPlaying(inView)
  })
  visibility.observe(wrap)

  void buildAtlas(members)
    .then(({ canvas, ctx }) => {
      if (disposed) return
      atlasContext = ctx
      texture = new THREE.CanvasTexture(canvas)
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
      material.uniforms.uMap.value = texture
      group.add(mesh)

      videos = createVideos(members, wrap)
      setPlaying(inView)
    })
    .catch(() => {
      /* Without the atlas the strip simply stays empty. */
    })

  function resize() {
    const width = wrap.clientWidth
    const height = wrap.clientHeight
    if (!width || !height) return
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()

    const viewHeight = 2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * CAMERA_Z
    const viewWidth = viewHeight * camera.aspect
    group.position.set(viewWidth * ANCHOR_X, viewHeight * ANCHOR_Y, 0)
  }

  // Bend the strip. `shift` is how far it has travelled along its own axis.
  function bend(shift: number) {
    const vertices = position.count
    for (let i = 0; i < vertices; i++) {
      const along = basePositions[i * 3] + totalLength / 2 // 0..totalLength
      const x = shift + along
      const y = basePositions[i * 3 + 1]
      // -1 at a panel's left edge, 0 in the middle, 1 at its right edge.
      const local = ((along % PANEL_W) / PANEL_W) * 2 - 1
      const z = WRAP * x * x + BOW * y * y + PANEL_BEND * local * local + WAVE * Math.sin(x * 0.7 + y * 0.4)
      position.setXYZ(i, x, y, z)
    }
    position.needsUpdate = true
    geometry.computeBoundingSphere()
  }

  const lerp = (from: number, to: number, t: number) => from + (to - from) * t

  // Bend the video panel exactly like the photos, then blend it (world position by world
  // position) towards a flat sheet that fills the view: `t` 0 is its place in the strip,
  // `t` 1 the whole screen.
  function updateReel(shift: number, t: number) {
    const viewHeight = 2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * CAMERA_Z
    const viewWidth = viewHeight * camera.aspect
    const start = totalLength + REEL_GAP
    for (let i = 0; i < reelPosition.count; i++) {
      const u = reelBase[i * 3] / REEL_W + 0.5 // 0..1 across the panel
      const y = reelBase[i * 3 + 1]
      const x = shift + start + u * REEL_W
      const local = u * 2 - 1
      const z = WRAP * x * x + BOW * y * y + PANEL_BEND * local * local + WAVE * Math.sin(x * 0.7 + y * 0.4)
      tmp.set(x, y, z).applyMatrix4(group.matrixWorld)
      const v = y / REEL_H + 0.5
      reelPosition.setXYZ(
        i,
        lerp(tmp.x, (u - 0.5) * viewWidth, t),
        lerp(tmp.y, (v - 0.5) * viewHeight, t),
        lerp(tmp.z, 0, t),
      )
    }
    reelPosition.needsUpdate = true
    reelMaterial.uniforms.uT.value = t
    reelMaterial.uniforms.uPlane.value.set(lerp(REEL_W, viewWidth, t), lerp(REEL_H, viewHeight, t))

    // From the second the first frame exists the panel shows the video itself.
    if (!videoTexture && reelVideo && reelVideo.readyState >= 2) {
      videoTexture = new THREE.VideoTexture(reelVideo)
      videoTexture.needsUpdate = true
      reelMaterial.uniforms.uMap.value = videoTexture
    }

    reel.dataset.full = t > 0.96 ? '1' : '0'
    const open = expanded > 0.03
    if (open !== reelOpen) {
      reelOpen = open
      onReel(open)
    }
  }

  function onPointerMove(event: PointerEvent) {
    const rect = wrap.getBoundingClientRect()
    ndc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    ndc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    pointerInside = true
  }

  function onPointerLeave() {
    pointerInside = false
  }

  let entered = enterRef.current

  function tick() {
    if (!texture) return

    // Fade in while the section arrives, so it never shows up cut off at the edge.
    entered += (enterRef.current - entered) * 0.15
    const eased = entered * entered * (3 - 2 * entered)
    renderer.domElement.style.opacity = String(eased)

    // Copy the current video frames into the atlas (capped, and only while on screen).
    if (inView && atlasContext && videos.length) {
      const now = performance.now()
      if (now - lastVideoDraw >= 1000 / VIDEO_FPS) {
        lastVideoDraw = now
        let drawn = false
        videos.forEach((video, index) => {
          if (video.readyState < 2 || !video.videoWidth) return
          drawTile(atlasContext!, { source: video, width: video.videoWidth, height: video.videoHeight }, index)
          drawn = true
        })
        if (drawn) texture.needsUpdate = true
      }
    }

    current += (progressRef.current - current) * 0.1
    expanded += (expandRef.current - expanded) * 0.12
    // The easing only ever approaches its target; close the last bit so the video lands
    // exactly centred and square instead of a few pixels off.
    if (Math.abs(expandRef.current - expanded) < 0.004) expanded = expandRef.current
    if (Math.abs(progressRef.current - current) < 0.002) current = progressRef.current
    const shift = START_X - current * travel
    bend(shift)
    group.updateMatrixWorld(true)
    updateReel(shift, expanded * expanded * (3 - 2 * expanded))

    // Which panel is under the pointer (the strip moves even when the pointer does not).
    let target = -1
    if (pointerInside) {
      raycaster.setFromCamera(ndc, camera)
      const hit = raycaster.intersectObject(mesh, false)[0]
      if (hit?.uv) target = Math.min(count - 1, Math.max(0, Math.floor(hit.uv.x * count)))
    }
    if (target !== hovered) {
      hovered = target
      onHover(hovered)
    }
    for (let i = 0; i < count; i++) {
      hoverValues[i] += ((i === hovered ? 1 : 0) - hoverValues[i]) * 0.12
    }

    // Pin the name tag to the bottom centre of the hovered panel.
    if (hovered >= 0) {
      const index = (SEG_Y - 3) * (SEG_X * count + 1) + hovered * SEG_X + SEG_X / 2
      tmp.fromBufferAttribute(position, index)
      mesh.localToWorld(tmp)
      tmp.project(camera)
      const x = (tmp.x * 0.5 + 0.5) * wrap.clientWidth
      const y = (-tmp.y * 0.5 + 0.5) * wrap.clientHeight
      label.style.transform = `translate3d(${x}px, ${y}px, 0)`
    }

    renderer.render(scene, camera)
  }

  resize()
  const observer = new ResizeObserver(resize)
  observer.observe(wrap)
  // After a jump to another part of the page, land on the final state instead of easing there.
  const snap = () => {
    current = progressRef.current
    expanded = expandRef.current
    entered = enterRef.current
  }
  window.addEventListener('kyma:snap', snap)
  wrap.addEventListener('pointermove', onPointerMove, { passive: true })
  wrap.addEventListener('pointerleave', onPointerLeave)
  gsap.ticker.add(tick)

  return () => {
    disposed = true
    gsap.ticker.remove(tick)
    observer.disconnect()
    visibility.disconnect()
    for (const video of videos) {
      video.pause()
      video.removeAttribute('src')
      video.load()
      video.remove()
    }
    window.removeEventListener('kyma:snap', snap)
    wrap.removeEventListener('pointermove', onPointerMove)
    wrap.removeEventListener('pointerleave', onPointerLeave)
    geometry.dispose()
    material.dispose()
    texture?.dispose()
    reelGeometry.dispose()
    reelMaterial.dispose()
    posterTexture?.dispose()
    videoTexture?.dispose()
    renderer.dispose()
    // Browsers cap the number of live WebGL contexts; release this one right away.
    renderer.forceContextLoss()
    renderer.domElement.remove()
  }
}
