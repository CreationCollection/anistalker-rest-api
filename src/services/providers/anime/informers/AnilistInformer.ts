import axios from "axios";

export class AnilistInformer {
    static async getAnilistInfo(anilistId: number): Promise<any> {
        const response = await axios.post(
            "https://graphql.anilist.co",
            {
                query: `
                query {
                    Media(id: ${anilistId}) {
                        title { english userPreferred }
                        synonyms
                        season
                        seasonYear
                        format
                        status
                        relations {
                            nodes {
                                title { english userPreferred }
                                format
                            }
                        }
                    }
                }
            `}
        )

        const data = response.data.data.Media
        return {
            title: {
                english: data.title.english,
                native: data.title.userPreferred
            },
            synonyms: data.synonyms,
            season: data.season,
            year: data.seasonYear,
            format: data.format,
            status: data.status,
            relations: data.relations.nodes.reduce((groups: any, item: any) => {
                if (
                    item.format != "TV" &&
                    item.format != "MOVIE" &&
                    item.format != "OVA" &&
                    item.format != "ONA" &&
                    item.format != "SPECIAL"
                ) return groups

                if (!groups[item.format]) groups[item.format] = []
                groups[item.format].push(item.title.userPreferred)
                return groups
            }, {}),
        }
    }
}
