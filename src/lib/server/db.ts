import { Sequelize } from 'sequelize'
import { makeConfig } from './model/Config';
import { makeContest } from './model/Contest';
import { makeSubmission } from './model/Submission';
import { makeUser } from './model/User';

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'data/verde.db'
});

export const User = makeUser(sequelize);
export const Contest = makeContest(sequelize);
export const Submission = makeSubmission(sequelize);
export const Config = makeConfig(sequelize);
export const ProblemSet = makeConfig(sequelize);

User.belongsToMany(Contest, { through: 'UserContests' });
Contest.belongsToMany(User, { through: 'UserContests' });

User.hasMany(Submission);
Submission.belongsTo(User);

Contest.hasMany(Submission);
Submission.belongsTo(Contest);

ProblemSet.hasMany(Contest);
Contest.belongsTo(ProblemSet);

await sequelize.sync({});