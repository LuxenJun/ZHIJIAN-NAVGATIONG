import request from '@/utils/request'

// 获取导航分类
// export const navGetCategoryService = () => request.get('/categories')

// 获取导航首页数据接口:
export const navGetListService = (userId) => request.post('/navigation/list', null, { params: { userId } })

// 获取全部导航
// export const navGetListService = () => request.get('/links')

// 添加分类
export const navAddCategoryService = (userId, name) => request.post('/navigation/addList', null, { params: { userId ,name} })

// 删除分类
export const navDeleteCategoryService = (userId, id) => request.post(`/navigation/deleteList`, null, { params: { userId ,id} })

// 添加导航
export const navAddLinkService = (userId, categoryId, {name, website, description}) => request.post('/navigation/add',  {  name, website, description } , { params: { userId, categoryId } })

// 删除导航
export const navDeleteLinkService = (userId, id) => request.post(`/navigation/delete`, null, { params: { userId ,id} })

//ai 推荐导航（后端转发大模型，body 字段名固定为 aiInput）
export const navRecommendService = (aiInput) => request.post('/ai/recommend', { aiInput })
