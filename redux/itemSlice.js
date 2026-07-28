import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    items: [],
    pallets: [],
    itemId: 0,
    employeeId: '',
    ip: ''
}

const itemSlice = createSlice({
    name: 'items',
    initialState,
    reducers: {
        setItems: (state, action) => {
            state.items = action.payload;
        },
        setPallets: (state, action) => {
            state.pallets = action.payload;
        },
        setItemId: (state, action) => {
            state.itemId = action.payload;
        },
        setEmployeeId: (state, action) => {
            state.employeeId = action.payload;
        },
        setIp: (state, action) => {
            state.ip = action.payload;
        },
        resetUser: (state, action) => {
            state.items = [];
            state.pallets = [];
            state.itemId = 0;
            state.employeeId = '';
        }
    }
})

export const {setItems, setPallets, setItemId, setEmployeeId, setIp, resetUser } = itemSlice.actions;
export default itemSlice.reducer;