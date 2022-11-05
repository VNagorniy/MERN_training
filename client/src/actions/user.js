import axios from 'axios';
import { setUser } from '../reducers/userReducers';
import { API_URL } from '../config';

export const registration = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}api/auth/registration`, {
      email,
      password,
    });
    alert(response.data.message);
  } catch (e) {
    alert(e.response.data.message);
  }
};

//Функция запроса логина на сервер
export const login = (email, password) => {
  return async (dispatch) => {
    try {
      const response = await axios.post(`${API_URL}api/auth/login`, {
        email,
        password,
      });
      dispatch(setUser(response.data.user));
      //Хранение токена
      localStorage.setItem('token', response.data.token);
    } catch (e) {
      alert(e.response.data.message);
    }
  };
};

//Функция запроса на авторизацию
export const auth = () => {
  return async (dispatch) => {
    try {
      const response = await axios.get(`${API_URL}api/auth/auth`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      dispatch(setUser(response.data.user));
      localStorage.setItem('token', response.data.token);
    } catch (e) {
      alert(e.response.data.message);
      localStorage.removeItem('token');
    }
  };
};

//Функция добавления аватарки
export const uploadAvatar = (file) => {
  return async (dispatch) => {
    try {
      //Передаём файл как FormData
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(`${API_URL}api/files/avatar`, formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      //Получаем от сервера пользователя
      dispatch(setUser(response.data));
    } catch (e) {
      console.log(e);
    }
  };
};

//Функция удаления аватарки
export const deleteAvatar = () => {
  return async (dispatch) => {
    try {
      const response = await axios.delete(`${API_URL}api/files/avatar`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      dispatch(setUser(response.data));
    } catch (e) {
      console.log(e);
    }
  };
};
