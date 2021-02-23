import { UserData } from 'src/users/interfaces/users.interface'

export interface RequestWithUserData {
  data: UserData
  iat: number
  exp: number
}
