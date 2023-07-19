interface Basic {
  created: string
  createdBy: string
  id: string | number
  title: string
}

export interface Body {
  [key: string]: string
}

export interface Env {
  DB: D1Database
  SECRET_KEY: string
}

export interface Page extends Basic {
  content: string
  description: string
  parentId?: string | number
  religionId: string
  slug: string
  summary: string
  topicId: string
  updated: string
  updatedBy: string
}

export interface Result {
  status: number
  data?: any
}

export interface User {
  created: string
  createdBy: string
  id: number
  updated: string
  updatedBy: string
  userName: string
}
