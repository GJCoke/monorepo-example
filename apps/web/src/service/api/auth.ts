import { request } from "../request"

/**
 * Login
 *
 * @param username Username
 * @param password Password
 */
export function fetchLogin(username: string, password: string) {
  return request<Api.Auth.LoginToken>({
    url: "/auth/login",
    method: "POST",
    data: {
      username,
      password,
    },
  })
}

/** Get user info */
export function fetchGetPublicKey() {
  return request<string>({ url: "/auth/keys/public" })
}

/** Get user info */
export function fetchGetUserInfo() {
  return request<Api.Auth.UserInfo>({ url: "/auth/user/info" })
}

/**
 * Refresh token
 *
 * @param refreshToken Refresh token
 */
export function fetchRefreshToken(refreshToken: string) {
  return request<Api.Auth.LoginToken>({
    url: "/auth/refreshToken",
    method: "post",
    data: {
      refreshToken,
    },
  })
}

/**
 * return custom backend error
 *
 * @param code error code
 * @param message error message
 */
export function fetchCustomBackendError(code: string, message: string) {
  return request({ url: "/auth/error", params: { code, message } })
}
