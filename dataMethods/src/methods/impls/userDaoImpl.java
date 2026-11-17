package methods.impls;

import mappers.userMapper;
import methods.daos.userDao;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.io.Resources;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;
import pojo.User;

import java.io.IOException;
import java.io.InputStream;

public class userDaoImpl implements userDao {
    // 类加载时只读取一次 mybatis-config.xml，全局复用同一个 SqlSessionFactory
    private static final SqlSessionFactory SQL_SESSION_FACTORY = buildSqlSessionFactory();
    private static SqlSessionFactory buildSqlSessionFactory() {
        try (InputStream inputStream = Resources.getResourceAsStream("mybatis-config.xml")) {
            return new SqlSessionFactoryBuilder().build(inputStream);
        } catch (IOException e) {
            throw new ExceptionInInitializerError(e);
        }
    }

    private User user;

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    @Override
    public void setUpUserTable() throws IOException {
        SqlSession sqlSession = SQL_SESSION_FACTORY.openSession();
        userMapper userMapper = sqlSession.getMapper(userMapper.class);
        userMapper.createTable();
        sqlSession.commit();
        sqlSession.close();
    }
    @Override
    public void addUser(String username , String password, String email) throws IOException{
        SqlSession sqlSession = SQL_SESSION_FACTORY.openSession();
        userMapper userMapper = sqlSession.getMapper(userMapper.class);
        userMapper.addUser(username,password,email);
        sqlSession.commit();
        sqlSession.close();
    }
    @Override
    public Integer selectUser(@Param("userName") String userName , @Param("password") String password) throws IOException{
        SqlSession sqlSession = SQL_SESSION_FACTORY.openSession();
        userMapper userMapper = sqlSession.getMapper(userMapper.class);
        User user =userMapper.selectUser(userName,password);
        sqlSession.close();
        if(user!=null){
            return 1;
        }
        else {
            return 0;
        }
    }
    @Override
    public void updatePassword(@Param("userName") String userName,@Param("password") String password) throws IOException {
        SqlSession sqlSession = SQL_SESSION_FACTORY.openSession();
        userMapper userMapper = sqlSession.getMapper(userMapper.class);
        userMapper.updatePassword(userName,password);
        sqlSession.commit();
        sqlSession.close();
    }
    @Override
    public void updateEmail(@Param("userName") String userName,@Param("password") String password,@Param("email") String email) throws IOException{
        userDaoImpl userMapperImpl = new userDaoImpl();
        Integer a  = userMapperImpl.selectUser(userName,password);
        SqlSession sqlSession = SQL_SESSION_FACTORY.openSession();
        userMapper userMapper = sqlSession.getMapper(userMapper.class);
        if (a==1){
            userMapper.updateEmail(userName,password,email);
            sqlSession.commit();
            sqlSession.close();
        }
        else{
            sqlSession.commit();
            sqlSession.close();
        }
    }
}
