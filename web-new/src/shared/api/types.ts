export type Paged<T> = {
  page: number
  page_size: number
  total: number
  items: T[]
}
