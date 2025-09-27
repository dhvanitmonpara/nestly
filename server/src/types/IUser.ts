export interface IUser {
    id: number,
    username: string,
    refreshToken: string | null
    email: string,
    displayName: string
    accentColor: string
    password: string | null
}