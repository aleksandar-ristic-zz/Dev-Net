const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config')
const { check, validationResult } = require('express-validator');
const normalizeUrl = require('normalize-url');

const User = require('../../models/User')

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post('/',
  check('name', 'Name is required').notEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 
  'Please enter a password with 6 or more characters')
  .isLength({ min: 6 }), 
  
  async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;
 
  try {
    // See if user exists
    let user = await User.findOne({ email });

    if (user) {
      return  res.status(400).json({ errors: [{ msg: 'User already exists' }] });
    }

    // Get users gravatar
    const avatar = normalizeUrl(
      gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm'
      }),
      { forceHttps: true }
    );

    user  = new User({
      name,
      email,
      avatar,
      password
    });

    // Encrypt the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // Return jsonwebtoken
    const payload = {
      user: {
        id: user.id
      }
    }

    jwt.sign(
      payload, 
      config.get('jwtSecret'),
      { expiresIn: '5 days' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      });

  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;