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
    @Override
    public void setUpUserTable() throws IOException {
        String resource = "mybatis-config.xml";
        InputStream inputStream = Resources.getResourceAsStream(resource);
        SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
        SqlSession sqlSession = sqlSessionFactory.openSession();
        userMapper userMapper = sqlSession.getMapper(userMapper.class);
        userMapper.createTable();
        sqlSession.commit();
        sqlSession.close();
    }
    @Override
    public void addUser(String username , String password, String email) throws IOException{
        String resource = "mybatis-config.xml";
        InputStream inputStream = Resources.getResourceAsStream(resource);
        SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
        SqlSession sqlSession = sqlSessionFactory.openSession();
        userMapper userMapper = sqlSession.getMapper(userMapper.class);
        userMapper.addUser(username,password,email);
        sqlSession.commit();
        sqlSession.close();
    }
    @Override
    public Integer selectUser(@Param("userName") String userName , @Param("password") String password) throws IOException{
        String resource = "mybatis-config.xml";
        InputStream inputStream = Resources.getResourceAsStream(resource);
        SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
        SqlSession sqlSession = sqlSessionFactory.openSession();
        userMapper userMapper = sqlSession.getMapper(userMapper.class);
        User user =userMapper.selectUser(userName,password);
        sqlSession.commit();
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
        String resource = "mybatis-config.xml";
        InputStream inputStream = Resources.getResourceAsStream(resource);
        SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
        SqlSession sqlSession = sqlSessionFactory.openSession();
        userMapper userMapper = sqlSession.getMapper(userMapper.class);
        userMapper.updatePassword(userName,password);
        sqlSession.commit();
        sqlSession.close();
    }
}
