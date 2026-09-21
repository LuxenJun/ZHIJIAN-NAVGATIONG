import request from '@/utils/request'

// 注册接口：POST
export const userRegisterService = ({
  username,
  password,
}) => request.post('/user/register', { username, password})

// 登陆接口：

export const userLoginService = ({ username, password }) =>
  request.post('/user/login', { username, password })

// 获取用户信息
export const userGetInfoService = () => request.post('/users/register')

// // 修改用户信息

export const userUpdateInfoService = (data) => request.post(`/user/information`, data)

// 修改用户密码接口
export const userUpdatePasswordService = (data) => request.post(`/user/password`, data)
