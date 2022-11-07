import { Sequelize, DataTypes } from 'sequelize';

export interface SubmissionType {
    id: number,
    problemId: string,
    score: number,
    status: number,
    usedTime: number,
    usedMemory: number,
    code: string,
    details: Record<string, unknown>,
    createdAt?: Date,
}

export const makeSubmission = function(sequelize: Sequelize) {
    return sequelize.define('Submission', {
        problemId: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        score: {
            type: DataTypes.INTEGER,
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        usedTime: {
            type: DataTypes.INTEGER,
        },
        usedMemory: {
            type: DataTypes.INTEGER,
        },
        code: {
            type: DataTypes.TEXT,
        },
        details: {
            type: DataTypes.TEXT,
            defaultValue: "{}",
        },
    });
}