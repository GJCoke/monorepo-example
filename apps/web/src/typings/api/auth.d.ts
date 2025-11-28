declare namespace Api {
  /**
   * namespace Auth
   *
   * backend api module: "auth"
   */
  namespace Auth {
    interface LoginToken {
      accessToken: string
      refreshToken: string
    }

    interface UserInfo {
      userId: string
      name: string
      roles: string[]
      buttons: string[]
    }
  }
}
