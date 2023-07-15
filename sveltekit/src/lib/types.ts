export interface Basic {
  id: number
  name: string
}

export interface Filter extends Basic {
  total: number
}

export interface Religion extends Basic {
  content: string
  description: string
  limit: number
  page: number
  parent: number
  slug: string
  summary: string
}

export interface Speaker {
  id: number
  firstname: string
  lastname: string
}

export interface Video {
  created: string
  id: number
  religion_id: number
  religion_name: string
  slug: string
  speakers: Speaker[]
  topics: Basic[]
  video_id: string
  video_image: string
  video_length: number
  video_title: string
  video_url: string
}

export interface VideoData {
  data: Video[]
  meta: VideoMeta
}

export interface VideoMeta {
  count: number
  limit: number
  next?: number
  page: number
  pages: number
  prev?: number
}
