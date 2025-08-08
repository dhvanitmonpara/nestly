export interface IUser {
    id: number,
    username: string,
    refresh_token: string | null
    email: string,
    display_name: string
    accent_color: string
    password: string | null
}