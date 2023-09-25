export class Video {
    constructor(
        public master: string,
        public hd: VideoFile | string | null = null,
        public uhd: VideoFile | string | null = null
    ) {  }
}

export class VideoFile {
    constructor(
        public url: string = '',
        public files: VideoSegment[] = []
    ) {  }
}

export class VideoSegment {
    constructor(
        public length: number = 0,
        public at: number = 0,
        public file: string = ''
    ) {  }
}