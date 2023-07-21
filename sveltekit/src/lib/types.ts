export interface HeroData {
  alt: string
  description?: string
  pages?: {name: string; url: string}[]
  image: string
  title: string
}

export interface UserInfo {
  accessTokenExpiration: number
  idTokenExpiration: number
  key: string
  sub: string
  email_verified: boolean
  nickname: string
  email: string
}

export interface Basic {
  id: number
  name: string
}

export interface Filter extends Basic {
  total: number
}

export interface Page {
  content: string
  created: string
  description: string
  hasComments: boolean
  id: number
  religion_id: number
  slug: string
  title: string
  topic_id: number
  updated: string
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

export interface ResultData {
  message?: string
  error?: string
}
