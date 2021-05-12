const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const config = require('config');
const axios = require('axios');
const { check, validationResult } = require('express-validator');

const normalize = require('normalize-url');
const checkObjectId = require('../../middleware/checkObjectId');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

// @route   GET api/profile/me
// @desc    Get current users profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile
    .findOne({ user: req.user.id })
    .populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }

    res.json(profile);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/profile
// @desc    Create or update user profile
// @access  Private
router.post('/', 
  auth,
  check('status', 'Status is required').notEmpty(),
  check('skills', 'Skills are required').notEmpty(),

  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      website,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
      // rest of the fields we dont need to check
      ...rest
    } = req.body; 

    // build a profile
    const profileFields = {
      user: req.user.id,
      website:
        website && website !== ''
          ? normalize(website, { forceHttps: true })
          : '',
      skills: Array.isArray(skills)
        ? skills
        : skills.split(',').map((skill) => ' ' + skill.trim()),
      ...rest
    };

    // Build socialFields object
    const socialFields = { youtube, twitter, instagram, linkedin, facebook };

    // normalize social fields to ensure valid url
    for (const [key, value] of Object.entries(socialFields)) {
      if (value && value.length > 0)
        socialFields[key] = normalize(value, { forceHttps: true });
    }
    // add to profileFields
    profileFields.social = socialFields;

    try {
      // Using upsert option (creates new doc if no match is found):
      let profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      return res.json(profile);

    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server Error');
    }
});

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    return res.json(profiles);

  } catch(err) {
    console.error(err.message);
     res.status(500).send('Server Error');
  }
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user id
// @access  Public
router.get('/user/:user_id', checkObjectId('user_id'), 
  async ({params: { user_id }}, res) => {
    try {
      const profile = await Profile.findOne({ user: user_id }).populate('user', ['name', 'avatar']);
      
      if (!profile) return res.status(400).json({ msg: 'Profile not found' });
      
     return res.json(profile);

    } catch(err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

// @route   DELETE api/profile
// @desc    Delete profile user & posts
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    // Remove user posts
    // Remove profile
    // Remove user
    await Promise.all([
      Post.deleteMany({ user: req.user.id }),
      Profile.findOneAndRemove({ user: req.user.id }),
      User.findOneAndRemove({ _id: req.user.id })
    ]);

    res.json({ msg: 'User removed' });

  } catch(err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  Private
router.put('/experience',
  auth,
  check('title', 'Title is required').notEmpty(),
  check('company', 'Company is required').notEmpty(),
  check('from', 'From date is required').notEmpty(),
 
  async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const profile = await Profile.findOne({ user: req.user.id });

    profile.experience.unshift(req.body);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }

});

// @route   DELETE api/profile/eperience/:exp_id
// @desc    Delete experience from profile
// @access  Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
   const profile = await Profile.findOne({ user: req.user.id });

   profile.experience = profile.experience.filter(
    (exp) => exp._id.toString() !== req.params.exp_id
  );

   await profile.save();
   return res.json(profile);

  } catch(err) {
   console.error(err.mesage);
   res.status(500).send('Server Error')
  }
});

// @route   PUT api/profile/education
// @desc    Add profile education
// @access  Private
router.put('/education', 
  auth,
  check('school', 'School is required').notEmpty(),
  check('degree', 'Degree is required').notEmpty(),
  check('fieldofstudy', 'Field of study is required').notEmpty(),
  check('from', 'From date is required also needs to be from the past').notEmpty()
  .custom((value, { req }) => (req.body.to ? value < req.body.to : true)),
 async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.education.unshift(req.body);

    await profile.save();
    res.json(profile);

  } catch(err) {
    console.error(err.message);
    res.status(500).send('Server Error')
  }
});

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete experience from profile
// @access  Private
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
   const profile = await Profile.findOne({ user: req.user.id });

   profile.education = profile.education.filter(
    (edu) => edu._id.toString() !== req.params.edu_id
  );

   await profile.save();
   return res.json(profile);

  } catch(err) {
   console.error(err.mesage);
   res.status(500).send('Server Error')
  }
});


// @route   GET api/profile/github/:username
// @desc    Get user repos from github
// @access  Public
router.get('/github/:username', async (req, res) => {
  try {
    const uri = encodeURI(
      `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
    );
    const headers = {
      'user-agent': 'node.js',
      Authorization: `token ${config.get('githubToken')}`
    };

    const gitHubResponse = await axios.get(uri, { headers });
    return res.json(gitHubResponse.data);
  } catch (err) {
    console.error(err.message);
    return res.status(404).json({ msg: 'No Github profile found' });
  }
});

module.exports = router;