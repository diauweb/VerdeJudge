import { Sequelize, DataTypes } from 'sequelize';

export interface ProblemSet {
    name: string,
    isHidden: boolean,
    problems: [],
}

export const makeProblemSet = function(sequelize: Sequelize) {
    return sequelize.define('ProblemSet', {
        name: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        isHidden: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        problems: {
            type: DataTypes.TEXT,
            defaultValue: [],
        }
    });
}