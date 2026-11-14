package mappers;

import org.apache.ibatis.annotations.Param;

import java.io.IOException;

public interface userMapper {
    void createTable();
    void addUser(@Param("userName") String userName , @Param("password") String password,@Param("email") String email);
}
