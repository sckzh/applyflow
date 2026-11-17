import mappers.userMapper;
import methods.impls.userDaoImpl;
import org.apache.ibatis.io.Resources;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;
import org.junit.Test;

import java.io.IOException;
import java.io.InputStream;

public class firstTest {
    @Test
    public void firstTest() throws IOException {
        String resource = "mybatis-config.xml";
        InputStream inputStream = Resources.getResourceAsStream(resource);
        SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
        SqlSession sqlSession = sqlSessionFactory.openSession();
        userMapper userMapper = sqlSession.getMapper(userMapper.class);
        userMapper.createTable();
        sqlSession.commit();
        sqlSession.close();
    }
    @Test
    public void selectUserTest() throws IOException {
        userDaoImpl userMapperImpl   = new userDaoImpl();
        Integer a  = userMapperImpl.selectUser("kzh","123456");
        System.out.println(a);
    }
    @Test
    public void updatePasswordTest() throws IOException {
        userDaoImpl userMapperImpl   = new userDaoImpl();
        userMapperImpl.updatePassword("kzh","12345678");
    }
}
