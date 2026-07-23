package com.bubbleflow.mapper;

import com.bubbleflow.dto.customer.request.CustomerRequest;
import com.bubbleflow.dto.customer.response.CustomerResponse;
import com.bubbleflow.entity.Customer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import java.util.List;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface CustomerMapper {

    CustomerResponse toResponse(Customer entity);

    List<CustomerResponse> toResponseList(List<Customer> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    Customer toEntity(CustomerRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    void updateEntity(CustomerRequest request, @MappingTarget Customer entity);
}
