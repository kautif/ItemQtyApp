import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    items: [],
    pallets: [],
    itemId: 0,
    employeeId: ''
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
        }
    }
})

export const {setItems, setPallets, setItemId, setEmployeeId } = itemSlice.actions;
export default itemSlice.reducer;