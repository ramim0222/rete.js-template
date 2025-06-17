// Define the available conditions and their evaluation functions
export const conditions = {
    equals: {
        label: 'Equals',
        evaluate: (value1, value2) => value1 === value2,
        description: 'Checks if two values are exactly equal'
    },
    not_equals: {
        label: 'Not Equals',
        evaluate: (value1, value2) => value1 !== value2,
        description: 'Checks if two values are not equal'
    },
    greater_than: {
        label: 'Greater Than',
        evaluate: (value1, value2) => Number(value1) > Number(value2),
        description: 'Checks if the first value is greater than the second'
    },
    less_than: {
        label: 'Less Than',
        evaluate: (value1, value2) => Number(value1) < Number(value2),
        description: 'Checks if the first value is less than the second'
    }
};

// Helper function to get all condition options for the select dropdown
export const getConditionOptions = () => {
    return Object.entries(conditions).map(([key, condition]) => ({
        value: key,
        label: condition.label
    }));
};

// Helper function to evaluate a condition
export const evaluateCondition = (conditionType, value1, value2) => {
    const condition = conditions[conditionType];
    if (!condition) {
        throw new Error(`Unknown condition type: ${conditionType}`);
    }
    return condition.evaluate(value1, value2);
};

// Helper function to get condition description
export const getConditionDescription = (conditionType) => {
    return conditions[conditionType]?.description || 'Unknown condition';
}; 