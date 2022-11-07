import { Sequelize, DataTypes } from 'sequelize';
import type { ProblemSet } from './ProblemSet';

enum ContestFlag {
    FLAG_WRONG_PUNISHMENT = 0b001,
    FLAG_NO_FEEDBACK = 0b010,
    FLAG_NO_REALTIME_RANK = 0b100,
}

export interface Contest {
    id: number,
    name: string,
    visible: boolean,
    beginTime: Date,
    endTime: Date,
    problems: ProblemSet,
    contestMode: ContestFlag,
}

export const makeContest = function(sequelize: Sequelize) {
    return sequelize.define('Contest', {
        name: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        visible: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        beginTime: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        endTime: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        contestMode: {
            type: DataTypes.INTEGER,
            defaultValue: 0, 
        },
        isOngoing: {
            type: DataTypes.VIRTUAL,
            get() {
                const beginTime = this.get('beginTime') as Date;
                const endTime = this.get('endTime') as Date;
                const now = new Date();
                return beginTime < now && endTime > now;
            },
            set(value) {
                if (value && this.get('isOngoing')) {
                    this.set('endTime', new Date());
                }
            }
        }
    });
}