const express = require("express")
const multer = require("multer")
const path = require("path")
const fs = require("fs")

const { Post, Hashtag } = require("../models")
const { isLoggedIn } = require("./middlewares")

const router = express.Router()

try {
  fs.readdirSync("uploads")
} catch (error) {
  console.error("uploads 폴더가 없어 새로 생성")
  fs.mkdirSync("uploads")
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "uploads/")
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname)
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext)
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
})

router.post("/img", isLoggedIn, upload.single("img"), (req, res) => {
  console.log(req.file)
  res.json({ url: `/img/${req.file.filename}` })
})

const upload2 = multer()
router.post("/", isLoggedIn, upload2.none(), async (req, res, next) => {
  try {
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      UserId: req.user.id,
    })
    const hashtags = req.body.content.match(/#[^\s#]+/g)
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map((tag) => {
          return Hashtag.findOrCreate({ // db에 해시태그가 존재하면 가져오고, 존재하지 않으면 생성한 후 가져옴
            where: { title: tag.slice(1).toLowerCase() },
          })
        })
      )
      await post.addHashtags(result.map((r) => r[0]))
    }
    res.redirect("/")
  } catch (error) {
    console.error(error)
    next(error)
  }
})

module.exports = router
