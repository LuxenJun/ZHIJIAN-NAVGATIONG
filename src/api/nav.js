import request from '@/utils/request'

// 获取导航分类
export const navGetCategoryService = () => request.get('/categories')


// 获取全部导航
export const navGetListService = () => request.get('/links')

// 添加分类
export const navAddCategoryService = (data) => request.post('/categories', data)

// 删除分类
export const navDeleteCategoryService = (id) => request.delete(`/categories/${id}`)

// 添加导航
export const navAddLinkService = ({name, url, description, categoryId}) => request.post('/links', {name, url, description, categoryId})

// 删除导航
export const navDeleteLinkService = (id) => request.delete(`/links/${id}`)
