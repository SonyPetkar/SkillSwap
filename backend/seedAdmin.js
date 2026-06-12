const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Sony@123', salt);
    
    await User.findOneAndUpdate(
      { email: 'sonypetkar1911@gmail.com' },
      {
        name: 'Sony Petkar',
        email: 'sonypetkar1911@gmail.com',
        password: hashedPassword,
        role: 'admin'
      },
      { upsert: true, new: true }
    );
    
    console.log('Admin credentials successfully configured.');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createAdmin();