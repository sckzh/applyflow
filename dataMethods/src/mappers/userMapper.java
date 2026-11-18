package mappers;

import org.apache.ibatis.annotations.Param;
import pojos.User;

import java.io.IOException;

public interface userMapper {
    void createTable();
    void addUser(@Param("userName") String userName , @Param("password") String password,@Param("email") String email);
    User selectUser(@Param("userName") String userName , @Param("password") String password);
    void updatePassword(@Param("userName") String userName , @Param("password") String password);
    void updateEmail(@Param("userName") String userName,@Param("password") String password,@Param("email") String email) throws IOException;
    int deleteUserById(@Param("id") int id);
}
