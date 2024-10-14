import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {},
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    saveUser: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = {};
    },
  },
});

export const { saveUser, logout } = userSlice.actions;
export default userSlice.reducer;
