package methods.interfaces;

import org.apache.ibatis.annotations.Param;

import java.io.IOException;

public interface Methods {
    void setUpUserTable() throws IOException;
    void addUser( String userName , String password, String email) throws IOException;
    Integer selectUser(@Param("userName") String userName , @Param("password") String password) throws IOException;
    void updatePassword(@Param("userName") String userName,@Param("password") String password) throws IOException;
}
