import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';

// LOCAL STRATEGY
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
  },
  async (email, password, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.password) {
        return done(null, false, { message: 'Incorrect credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      return isMatch ? done(null, user) : done(null, false, { message: 'Incorrect credentials' });
    } catch (err) {
      return done(err);
    }
  }
));

// GOOGLE STRATEGY
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK!,
  },
  async (
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: Express.User | false) => void
  ) => {
    try {
      const email = profile.emails?.[0].value;
      let user = await prisma.user.findUnique({ where: { googleId: profile.id } });

      if (!user && email) {
        user = await prisma.user.create({
          data: {
            email,
            name: profile.displayName,
            provider: 'google',
            googleId: profile.id,
          },
        });
      }

      if (!user) {
        return done(null, false); // ✅ fix here
      }

      return done(null, user); // ✅ now safe
    } catch (err) {
      return done(err);
    }
  }
));


// SERIALIZE / DESERIALIZE
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
