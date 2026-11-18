package todo;

import daos.userDao;
import daoImpls.userDaoImpl;

import java.io.IOException;

public class main {
    static void main() throws IOException {
        userDao setUserTableDao = new userDaoImpl();
        setUserTableDao.setUpUserTable();
    }
}
