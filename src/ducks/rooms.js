const ADD = '@avalon/rooms/ADD';
const UPDATE = '@avalon/rooms/UPDATE';

const initialState = {};
const reducer = (state = initialState, action = {}) => {
    const { type, payload } = action;

    switch (type) {
        case ADD: return { ...state, ...payload };
        case UPDATE: return { ...state, [payload._id]: { ...payload } };
        default: return state;
    }
}
export default reducer;

export const actions = {
    addRooms: payload => ({ type: ADD, payload }),
    updateRoom: payload => ({ type: UPDATE, payload }),
};