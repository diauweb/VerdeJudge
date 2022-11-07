import { Sequelize, DataTypes } from 'sequelize';

export enum UserPermission {
    GUEST = 0,
    CONTESTANT = 1,
    ADMIN = 2,
}

export interface UserType {
    name: string,
    password: string,
    isActive: boolean,
    permission: number,
}

export const makeUser = function(sequelize: Sequelize) {
    return sequelize.define('User', {
        name: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        password: {
            type: DataTypes.CHAR(40),
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
        },
        permission: {
            type: DataTypes.INTEGER,
            defaultValue: UserPermission.GUEST,
            allowNull: false,
        },
    });
}