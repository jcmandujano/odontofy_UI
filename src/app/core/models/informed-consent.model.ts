export class InformedConsent {
    id!: number
    name!: string | null
    description!: string | null
    file_url!: string | null
    createdAt!: string

    constructor() {
        this.name = null
        this.description = null
        this.file_url = null
    }
}