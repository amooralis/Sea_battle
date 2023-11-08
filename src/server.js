const {Sequelize} = require("sequelize");
const express = require('express');
const PORT = 3456;
const app = express();
const session = require("express-session");
const FileStore = require('session-file-store')(session);
const {User, Battle} = require('./models');

/* ----- MAIN PRESETS ----- */

app.use(express.json());
app.set('view engine', 'hbs')
app.use(express.static('views'))

const sequelize = new Sequelize("sea_battle", "postgres", "21082001", {  // поменять пароль
    dialect: "postgres",
    host: "127.0.0.1",
    port: 5432,
});

app.use(session({
    secret: "elephant-inside",
    resave: false,
    saveUnititialized: true,
    cookie: {secure: false},
    store: new FileStore()
}))

const isAuth = (req, res, next) => {
    if (req.session.userid) {
        next();
    } else {
        res.redirect("/signin");
    }
}

sequelize.authenticate()
    .then(() => {
        console.log('Успешное подключение к базе данных');
    })
    .catch(err => {
        console.error('Ошибка подключения к базе данных:', err);
    });

User.sync();
Battle.sync();
sequelize.sync()
    .then(() => {
        console.log('Модели синхронизированы с базой данных');
    })
    .catch(err => {
        console.error('Ошибка синхронизации моделей:', err);
    });

sequelize.getQueryInterface().showAllTables().then(tableNames => {
    console.log("Список таблиц в базе данных:", tableNames);
});

/* ----- MAIN ROUTES ----- */

app.get('/', isAuth, function (req, res) {
    res.render('game.hbs', {
        title: 'Main Page'
    })
})

app.get('/myStats', isAuth, async function (req, res) {
    const id = req.session.userid;
    const battles = await Battle.findAll({where: {userId: id}});
    const statistics = count_statistics(battles);
    res.render('myStats.hbs', {
        title: 'My Statistics',
        statistics
    })
})

app.get("/bestPlayers", isAuth, async (req, res) => {
    const users = await User.findAll();
    let bestPlayers = [];
    let statistics = {}
    for (const user of users) {
        const battles = await Battle.findAll({where: {userId: user.id}});
        if (battles.length > 10) {
            statistics = count_statistics(battles);
            const player = {
                login: user.login,
                totalGames: statistics.totalGames,
                winRate: statistics.winRate,
            }
            bestPlayers.push(player);
        }
    }
    bestPlayers = bestPlayers.sort((a, b) => a.winRate < b.winRate ? 1 : -1);
    res.render('topPlayers.hbs', {
        title: 'Top Players',
        bestPlayers,
    })
});

app.get('/signin', function (req, res) {
    res.render('signin.hbs', {
        title: 'Sign In',
    })
})

app.get('/signup', function (req, res) {
    res.render('signup.hbs', {
        title: 'Sign Up',
    })
})

app.get("/logout", async (req, res) => {
    req.session.destroy();
    res.redirect("/signin");
});

/* ----- API ROUTES ----- */

app.post("/signin", async (req, res) => {
    const user = await User.findOne({
        where: {
            login: req.body.login,
            password: req.body.password,
        }
    });

    if (user) {
        req.session.userid = user.id;
        req.session.login = user.login;
        res.json(user);
    } else {
        res.status(403).json({message: "неверно"});
    }
});

app.post("/signup", async (req, res) => {
    const user = await User.create(req.body);
    res.json(user);
});

app.post("/user", async (req, res) => {
    const user = await User.create(req.body);
    res.json(user);
});

app.get("/allusers", async (req, res) => {
    const users = await User.findAll();
    res.json(users);
});

app.post("/battle", async (req, res) => {
    const battle = await Battle.create({
        status: false,
        destroyedShip1: 0,
        destroyedShip2: 0,
        destroyedShip3: 0,
        destroyedShip4: 0,
        userId: req.session.userid,
    });
    res.json(battle);
})

app.put("/battle/:id", async (req, res) => {
    console.log(req.params.id)
    const id = req.params.id;
    // const battle = await Battle.findByPk(req.params.id);
    const battle = await Battle.findOne({where: {id}});
    console.log(battle)
    if (battle) {
        console.log(req.body)
        await battle.update(req.body);
        console.log(battle)
        res.json(battle);
    } else {
        res.status(404).json({message: "не найдено"});
    }
})

/* ---- UTILS FUNCTIONS ----- */

function count_statistics(battles) {
    if (battles.length > 0) {
        let totalDestroyedShip1 = 0;
        let totalDestroyedShip2 = 0;
        let totalDestroyedShip3 = 0;
        let totalDestroyedShip4 = 0;
        let totalGames = 0;
        let winGames = 0;
        let totalShips, winRate;

        for (const battle of battles) {
            totalGames += 1;
            if (battle.status) {
                winGames += 1;
            }
            totalDestroyedShip1 += battle.destroyedShip1;
            totalDestroyedShip2 += battle.destroyedShip2;
            totalDestroyedShip3 += battle.destroyedShip3;
            totalDestroyedShip4 += battle.destroyedShip4;
        }

        totalShips = totalDestroyedShip1 + totalDestroyedShip2 + totalDestroyedShip3 + totalDestroyedShip4;
        winRate = parseFloat(((winGames / totalGames) * 100).toFixed(1));
        return {
            totalShips,
            totalDestroyedShip1,
            totalDestroyedShip2,
            totalDestroyedShip3,
            totalDestroyedShip4,
            totalGames,
            winRate,
        };
    } else {
        return 0;
    }
}

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
})
