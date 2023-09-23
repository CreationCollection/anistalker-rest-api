import { Manga, MangaChapter, MangaDate, MangaDetail, MangaMapping, MangaRelation } from "../../models/MangaModels.js"


export function extractMangaData(data: any): Manga | null {
    if (!data) return null

    let manga = new Manga()
    let attrs = data.attributes
    
    manga.id = data.id
    manga.title = new MangaDetail('en', attrs.title.en)
    manga.desc = new MangaDetail('en', attrs.description.en)
    manga.lastVolume = attrs.lastVolume ? parseInt(attrs.lastVolume) : null
    manga.lastChapter = attrs.lastChapter ? parseInt(attrs.lastChapter) : null
    manga.type = attrs.publicationDemographic
    manga.status = attrs.status
    manga.year = attrs.year
    manga.rating = attrs.contentRating
    manga.englishAvailable = attrs.availableTranslatedLanguages.includes('en')
    manga.latestChapterId = attrs.latestUploadedChapter
    if (attrs.links?.al)
        manga.mapping = new MangaMapping(attrs.links.al, attrs.links.mal)

    attrs.altTitles.forEach((title: any) => {
        if (title.en && title.en.length > 0)
            manga.altTitles.push(new MangaDetail('en', title.en))
    })
    attrs.tags.forEach((tag: any) => {
        let name = tag.attributes.name.en
        if (name && name.length > 0)
            manga.genres.push(tag.attributes.name.en)
    });
    data.relationships.forEach((r: any) => {
        if (r.type == 'manga') {
            manga.relation.push(new MangaRelation(r.related, r.id))
        }
        else if (r.type == 'cover') {
            manga.coverId = r.id
        }
    });

    return manga
}

export function extractChapterData(data: any): MangaChapter[] {
    if (data == null) return []
    let list: MangaChapter[] = []

    data.forEach((d: any) => {
        let chapter = new MangaChapter()

        chapter.id = d.id

        let attr =d.attributes

        chapter.chapter = attr.chapter
        chapter.volume = attr.volume
        chapter.title = attr.title
        chapter.pages = attr.pages
        chapter.published = MangaDate.extractDate(attr.publishAt)
        chapter.updated = MangaDate.extractDate(attr.updatedAt)

        list.push(chapter)
    });

    list.sort((a, b) => parseFloat(b.chapter ?? b.volume ?? "0") - parseFloat(a.chapter ?? a.volume ?? "0"))

    return list
}

export function extractPanelUrl(data: any, low: boolean = false): string[] {
    let list: string[] = []

    if (!data) return list

    let baseUrl = `${data.baseUrl}/${ low ? "dataSaver" : "data" }/${ data.chapter.hash }/`;

    (low ? data.chapter.dataSaver : data.chaper.data).forEach((l: string) => {
        list.push(baseUrl + l)
    });

    return list
}