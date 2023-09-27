type Inventory = {
    [key: string]: number;
};

const settings: { creeps: Inventory } = {
    // local spawn limits
    creeps: {
        worker: 3,
        builder: 1
    }
};

export default settings;
