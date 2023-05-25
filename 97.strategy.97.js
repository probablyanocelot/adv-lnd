let Strategy = function () {
    this.strategy = "";
};

Strategy.prototype = {
    setStrategy: function (strategy) {
        this.strategy = strategy;
    },

    init: function (context) {
        return this.strategy.init(context);
    }
};

let UPS = function () {
    this.init = function (context) {
        console.log(context)
        // calculations...
        return "$45.95";
    }
};

let USPS = function () {
    this.init = function (context) {
        console.log(context)
        // calculations...
        return "$39.40";
    }
};

let Fedex = function () {
    this.init = function (context) {
        console.log(context)
        // calculations...
        return "$43.20";
    }
};

class context {
    constructor(from, to, weight) {
        this.from = from;
        this.to = to;
        this.weight = weight;
    }
}

function run() {

    let context = { from: "76712", to: "10012", weight: "lkg" };

    // the 3 strategies

    let ups = new UPS();
    let usps = new USPS();
    let fedex = new Fedex();

    let strategy = new Strategy();

    strategy.setStrategy(ups);
    console.log("UPS Strategy: " + strategy.init(context));
    strategy.setStrategy(usps);
    console.log("USPS Strategy: " + strategy.init(context));
    strategy.setStrategy(fedex);
    console.log("Fedex Strategy: " + strategy.init(context));
}

// let Strategy = function () {
//     this.strategy = null
// };

// Strategy.prototype = {
//     setStrategy: function (strategy) {
//         this.strategy = strategy;
//     },

//     init: async function (context) {
//         return await this.strategy.init(context);
//     }
// };

// class Farm {
//     init(context) {
//         smart_move(context.location);
//         return init;
//     }
// };

// class Goo {
//     context = {
//         location: "goo"
//     }
// }

// let strategy = new Strategy();
// let farm = new Farm();
// let goo = new Farm();