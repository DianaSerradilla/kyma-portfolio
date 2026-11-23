import dianaPoster from '../assets/team/diana-serradilla.jpg'
import dianaVideo from '../assets/team/diana-serradilla.mp4'
import fernandaPoster from '../assets/team/fernanda-gomez.jpg'
import fernandaVideo from '../assets/team/fernanda-gomez.mp4'
import lukasPoster from '../assets/team/lukas-castro.jpg'
import lukasVideo from '../assets/team/lukas-castro.mp4'
import matiasPoster from '../assets/team/matias-caballero.jpg'
import matiasVideo from '../assets/team/matias-caballero.mp4'
import naylaPoster from '../assets/team/nayla-barrera.jpg'
import naylaVideo from '../assets/team/nayla-barrera.mp4'
import victoriaPoster from '../assets/team/victoria-cancinos.jpg'
import victoriaVideo from '../assets/team/victoria-cancinos.mp4'

export type TeamMember = {
  id: string
  name: string
  role: string
  /** Still portrait (first frame). Used as a poster and wherever the video does not play. */
  photo: string
  /** Short looping clip of the portrait. */
  video: string
}

export const team: TeamMember[] = [
  { id: 'matias-caballero', name: 'Matias Caballero', role: 'Ux-Ui | Photographer and filmmaker', photo: matiasPoster, video: matiasVideo },
  { id: 'nayla-barrera', name: 'Nayla Barrera', role: '3D Asset Artist', photo: naylaPoster, video: naylaVideo },
  {
    id: 'victoria-cancinos',
    name: 'Victoria Cancinos',
    role: 'Audiovisual Producer & Branding',
    photo: victoriaPoster,
    video: victoriaVideo,
  },
  { id: 'lukas-castro', name: 'Lukas Castro', role: 'Motion Graphics & Audiovisual Artist', photo: lukasPoster, video: lukasVideo },
  { id: 'fernanda-gomez', name: 'Fernanda Gomez', role: 'Branding | 3D Art', photo: fernandaPoster, video: fernandaVideo },
  { id: 'diana-serradilla', name: 'Diana Serradilla', role: 'Creative Technologist | AI • Web Design', photo: dianaPoster, video: dianaVideo },
]
