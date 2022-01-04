const passport = require("passport")
const local = require("./localStrategy")
const kakao = require("./kakaoStrategy")
const User = require("../models/user")

module.exports = () => {
  // 로그인 시 실행되며, req.session 객체에 어떤 데이터를 저장할지 정함 (done의 두번째 인수)
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  // 매 요청 시 실행.
  passport.deserializeUser((id, done) => {
    User.findOne({ where: id })
      .then((user) => done(null, user)) // db에서 조회한 정보를 req.user에 저장
      .catch((err) => done(err))
  })

  local()
  kakao()
}
