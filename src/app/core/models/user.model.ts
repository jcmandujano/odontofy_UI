export class User {
    public id!: number
    public name?: string
    public middle_name?: string
    public last_name?: string
    public date_of_birth?: Date
    public phone?: string
    public avatar?: string
    public email?: string 
    public password?:string

    /* static fromJson(json: any): User{
        const user = new User()
        user.jwt = json.jwt
        
        user.profile = new Profile()
        user.profile.id = json.user.id
        user.profile.username = json.user.username
        user.profile.email = json.user.email
        user.profile.provider = json.user.provider
        user.profile.confirmed = json.user.confirmed
        user.profile.blocked = json.user.blocked
        user.profile.createdAt = json.user.createdAt
        user.profile.updatedAt = json.user.updatedAt
        user.profile.nombre = json.user.nombre
        user.profile.apellido_paterno = json.user.apellido_paterno
        user.profile.apellido_materno = json.user.apellido_materno
        user.profile.fecha_nacimiento = json.user.fecha_nacimiento
        user.profile.no_cedula = json.user.no_cedula
        user.profile.especialidad = json.user.especialidad
        user.profile.cedula_especialidad = json.user.cedula_especialidad
        user.profile.biografia = json.user.biografia
        return user
    }

    static toJson(user: User): any{
        const obj = {
            jwt: user.jwt,
            profile: user.profile
        }
        return obj
    } */

}

