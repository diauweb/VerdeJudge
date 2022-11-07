import { DataTypes, type Sequelize } from "sequelize";

export const makeConfig = function(sequelize: Sequelize) {
    return sequelize.define('Config', {
        key: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        value: {
            type: DataTypes.TEXT,
            defaultValue: ""
        },
    })
}
