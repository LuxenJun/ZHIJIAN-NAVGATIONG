import request from '@/utils/request'

// 注册接口：POST /users 会在 db.json 里创建一条用户记录
export const userRegisterService = ({
  username,
  password,
}) => request.post('/users', { username, password})

// 登陆接口：json-server 没有登录路由，
// 用条件查询模拟 —— 查到匹配的用户名+密码就算登录成功
export const userLoginService = ({ username, password }) =>
  request.get('/users', { params: { username, password } })

// 获取用户信息
export const userGetInfoService = () => request.get('/users')

// 修改用户信息
export const userUpdateInfoService = (id, data) => request.patch(`/users/${id}`, data)
