package daos;

import org.apache.ibatis.annotations.Param;

import java.io.IOException;

public interface userDao {
    void setUpUserTable() throws IOException;
    void addUser( String userName , String password, String email) throws IOException;
    Integer selectUser(String userName , String password) throws IOException;
    void updatePassword(String userName, String password) throws IOException;
    void updateEmail( String userName, String password,String email) throws IOException;
    int deleteUserById(int id) throws IOException;
}
