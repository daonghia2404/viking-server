const express = require("express");
const validator = require('validator');
const router = express.Router();
const User = require("../../models/user/user");
const {
  hassPasword,
  comparePassword,
  signToken,
  authenticateToken,
  authenticateRefreshToken,
  authenticateResetPasswordToken,
} = require("../../controllers/auth/auth");
const {createTransporter, configMailOption} = require('../../utils/mail')

router.post("/register", async (req, res) => {
  const hashPw = await hassPasword(req.body.password);

  const newUser = new User({
    username: req.body.username,
    password: hashPw,
    email: req.body.email,
  });

  try {
    await newUser.save()
    res.json({
      success: true,
      response: {
        username: result.username,
        password: result.password,
      },
    });
  } catch (err) {
    if (err.keyValue.email) {
      res.json({
        success: false,
        message: 'Email đã tồn tại',
      });
    }
    if (err.keyValue.username) {
      res.json({
        success: false,
        message: 'Username đã tồn tại',
      });
    }
  }
});

router.post("/sign-in", async (req, res) => {
  const user = {
    username: req.body.username,
    password: req.body.password,
  };
  const targetUser = await User.findOne({ username: user.username });
  if (targetUser) {
    if (await comparePassword(user.password, targetUser.password)) {
      const token = signToken("access", {
        id: targetUser._id,
        username: targetUser.username,
      });
      const refreshToken = signToken("refresh", {
        id: targetUser._id,
        username: targetUser.username,
      });

      const storageRefreshToken = targetUser.refreshToken;
      storageRefreshToken.push(refreshToken);
      const updateUser = await User.updateOne(
        { username: user.username },
        {
          refreshToken: storageRefreshToken,
        }
      );
      res.json({
        success: true,
        response: {
          username: targetUser.username,
          token,
          refreshToken,
        },
      });
    } else {
      res.json({
        success: false,
        message: "Tài khoản hoặc mật khẩu sai !",
      });
    }
  } else {
    res.json({
      success: false,
      message: "Tài khoản hoặc mật khẩu sai !",
    });
  }
});

router.delete("/logout", authenticateToken, async (req, res) => {
  if (req.response.id) {
    const user = {
      username: req.response.username,
    };
    await User.updateOne(
      { username: user.username },
      {
        refreshToken: [],
      }
    );
    res.json({
      success: true,
      response: {},
    });
  }
});

router.post("/refresh-token", authenticateRefreshToken, async (req, res) => {
  const user = {
    username: req.response.username,
    refreshToken: req.response.refreshToken
  }
  const targetUser = await User.findOne({ username: user.username });
  const storageRefreshToken = targetUser.refreshToken;

  if (!storageRefreshToken.includes(user.refreshToken)) return res.sendStatus(403);

  const token = signToken("access", {
    id: targetUser._id,
    username: targetUser.username,
  });
  res.json({
    success: true,
    response: {
      token,
    },
  });
});

router.post('/forgot-password', async (req, res) => {
  const resetPasswordToken = signToken("reset-password", {
    email: req.body.email,
  });
  const targetEmail = req.body.email
  if (!validator.isEmail(targetEmail)) {
    return res.json({
      success: false,
      message: 'Email không hợp lệ'
    })
  }
  const transporter = createTransporter()
  const options = configMailOption(
    targetEmail,
    'Viking Network Socials - Reset password',
    'Reset Password',
    `<p>
      Bấm vào link dưới đây để đổi mật khẩu:
      <a href="#">http://localhost:3000/reset-password?token=${resetPasswordToken}</a>
      <br />
      <strong>Lưu ý: Link chỉ tồn tại trong vòng 5 phút</strong>
    </p>`
  )
  transporter.sendMail(options, (err, result) => {
    if (err) {
      res.json({
        success: false,
        message: 'Lỗi hệ thống'
      })
    } else {
      res.json({
        success: true,
        response: {
          resetPasswordToken,
        },
      })
    }
  })
})

router.post('/check-reset-password', authenticateResetPasswordToken, async (req, res) => {
  res.json({
    success: true,
    response: {},
  })
})

router.post('/reset-password', authenticateResetPasswordToken, async (req, res) => {
  const user = { email: req.response.email }
  const hashPw = await hassPasword(req.body.newPassword);
  await User.updateOne({ email: user.email }, { password: hashPw })
  res.json({
    success: true,
    response: {},
  })
})

router.get("/test-auth", authenticateToken, (req, res) => {
  if (req.response.id) {
    res.json({
      success: true,
    });
  } else {
    res.json({
      success: false,
    });
  }
});

module.exports = router;
