const express = require("express")
const passport = require("passport")

const { isLoggedIn } = require("./middlewares")
const User = require("../models/user")

const router = express.Router()

router.post("/:id/follow", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } })
    if (user) {
      await user.addFollowing(parseInt(req.params.id, 10))
      res.send("success")
    } else {
      res.status(404).send("no user")
    }
  } catch (error) {
    console.error(error)
    next(error)
  }
})

router.delete("/:id/follow", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } })
    if (user) {
      await user.removeFollowings(parseInt(req.params.id, 10)) // following이 어디서 온걸까
      res.send("success")
    } else {
      res.status(404).send("no user")
    }
  } catch (err) {
    console.error(err)
    next(err)
  }
})

router.patch("/:id", isLoggedIn, (req, res, next) => {
  const { nick } = req.body
  try {
    passport.authenticate("local", async (authError, user, info) => {
      if (authError) {
        console.error(authError)
        return next(authError)
      }
      if (!user) {
        res.status(404).send(info.message)
        return
      }
      await User.update({ nick }, { where: { id: req.params.id } })
      res.send("success")
    })(req, res, next)
  } catch (err) {
    console.error(err)
    next(err)
  }
})

module.exports = router
