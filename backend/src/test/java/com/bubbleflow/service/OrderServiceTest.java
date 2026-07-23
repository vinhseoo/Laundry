package com.bubbleflow.service;

import com.bubbleflow.dto.order.request.OrderItemRequest;
import com.bubbleflow.dto.order.request.OrderRequest;
import com.bubbleflow.dto.order.response.OrderResponse;
import com.bubbleflow.entity.Customer;
import com.bubbleflow.entity.Order;
import com.bubbleflow.entity.Service;
import com.bubbleflow.exception.BusinessException;
import com.bubbleflow.mapper.OrderMapper;
import com.bubbleflow.repository.*;
import com.bubbleflow.service.impl.OrderServiceImpl;
import com.bubbleflow.service.impl.SystemSettingsServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.statemachine.config.StateMachineFactory;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrderServiceTest {

    @Mock private OrderRepository orderRepository;
    @Mock private ServiceRepository serviceRepository;
    @Mock private OrderStateLogRepository orderStateLogRepository;
    @Mock private StorageRackRepository storageRackRepository;
    @Mock private StringRedisTemplate stringRedisTemplate;
    @Mock private SystemSettingsServiceImpl systemSettingsService;
    @Mock private StateMachineFactory stateMachineFactory;
    @Mock private CustomerRepository customerRepository;
    @Mock private LaundryBasketRepository laundryBasketRepository;
    @Mock private OrderMapper orderMapper;

    @InjectMocks
    private OrderServiceImpl orderService;

    private Service service;
    private Customer customer;
    private Order order;

    @BeforeEach
    public void setUp() {
        service = Service.builder()
                .id(1L)
                .name("Giặt sấy tiêu chuẩn")
                .code("GIAT_SAY_TIEU_CHUAN")
                .price(BigDecimal.valueOf(15000))
                .isActive(true)
                .build();

        customer = Customer.builder()
                .id(1L)
                .name("Nguyễn Văn A")
                .phone("0987654321")
                .isActive(true)
                .build();

        order = Order.builder()
                .id(1L)
                .customerName("Nguyễn Văn A")
                .customerPhone("0987654321")
                .customer(customer)
                .status("RECEIVED")
                .isActive(true)
                .totalAmount(BigDecimal.valueOf(16200)) // 15000 + 8% VAT
                .build();
    }

    @Test
    public void testCreateOrder_Success() {
        // Arrange
        OrderRequest request = new OrderRequest();
        request.setCustomerName("Nguyễn Văn A");
        request.setCustomerPhone("0987654321");
        
        OrderItemRequest itemRequest = new OrderItemRequest();
        itemRequest.setServiceId(1L);
        itemRequest.setQuantity(BigDecimal.ONE);
        request.setItems(Collections.singletonList(itemRequest));

        when(orderMapper.toEntity(any(OrderRequest.class))).thenReturn(new Order());
        when(customerRepository.findByPhone("0987654321")).thenReturn(Optional.of(customer));
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(service));
        when(systemSettingsService.getStringSetting("vat_rate", "8")).thenReturn("8");
        when(orderRepository.save(any(Order.class))).thenReturn(order);
        
        OrderResponse expectedResponse = new OrderResponse();
        expectedResponse.setId(1L);
        expectedResponse.setOrderCode("ORD-12345");
        expectedResponse.setTotalAmount(BigDecimal.valueOf(16200));
        when(orderMapper.toResponse(any(Order.class))).thenReturn(expectedResponse);

        // Act
        OrderResponse response = orderService.create(request);

        // Assert
        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals(BigDecimal.valueOf(16200), response.getTotalAmount());
        verify(orderRepository, times(1)).save(any(Order.class));
    }

    @Test
    public void testCreateOrder_ServiceInactive_ThrowsException() {
        // Arrange
        OrderRequest request = new OrderRequest();
        request.setCustomerName("Nguyễn Văn A");
        request.setCustomerPhone("0987654321");
        
        OrderItemRequest itemRequest = new OrderItemRequest();
        itemRequest.setServiceId(1L);
        itemRequest.setQuantity(BigDecimal.ONE);
        request.setItems(Collections.singletonList(itemRequest));

        service.setIsActive(false); // Inactive service

        when(orderMapper.toEntity(any(OrderRequest.class))).thenReturn(new Order());
        when(customerRepository.findByPhone("0987654321")).thenReturn(Optional.of(customer));
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(service));

        // Act & Assert
        assertThrows(BusinessException.class, () -> orderService.create(request));
        verify(orderRepository, never()).save(any(Order.class));
    }
}
