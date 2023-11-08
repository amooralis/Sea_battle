// psql -U postgres
const {Sequelize} = require("sequelize");

const sequelize = new Sequelize("sea_battle", "postgres", "21082001", {
    dialect: "postgres",
    host: "127.0.0.1",
    port: 5432,
});

const User = sequelize.define(
    "User",
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        login: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
        }
    },
    {
        freezeTableName: true,
        timestamps: false,
    }
);


const Battle = sequelize.define(
    "Battle",
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        status: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        destroyedShip1: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        destroyedShip2: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        destroyedShip3: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        destroyedShip4: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
    },
    {
        freezeTableName: true,
        timestamps: false,
    }
);

User.hasMany(Battle, {
    foreignKey: 'userId',
});

Battle.belongsTo(User, {
    foreignKey: 'userId',
});

module.exports = {
    User,
    Battle,
};